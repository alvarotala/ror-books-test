class DashboardsController < ApplicationController
  def librarian
    return render json: { error: 'Forbidden' }, status: :forbidden unless current_user.librarian?

    today = Date.current
    data = {
      total_books: Book.count,
      currently_borrowed: Borrowing.borrowed.count,
      due_today: Borrowing.where(due_date: today, status: :borrowed).count,
      members_with_overdue: Borrowing.overdue.select(:user_id).distinct.count,
      top_genres: Book.group(:genre).order(Arel.sql('count_all desc')).limit(5).count,
      recent_borrowings: Borrowing.order(created_at: :desc).limit(5).includes(:book, :user).as_json(include: { book: { only: [:id, :title] }, user: { only: [:id, :email, :first_name, :last_name] } })
    }

    render json: data
  end

  def member
    return render json: { error: 'Forbidden' }, status: :forbidden unless current_user.member?

    data = {
      current_borrowings: current_user.borrowings.borrowed.includes(:book).as_json(include: :book),
      history: current_user.borrowings.order(created_at: :desc).limit(20).as_json(include: :book)
    }

    render json: data
  end
end
