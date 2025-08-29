class DashboardsController < ApplicationController
  def librarian
    return render json: { error: 'Forbidden' }, status: :forbidden unless current_user.librarian?

    today = Date.current
    data = {
      total_books: Book.count,
      currently_borrowed: Borrowing.borrowed.count,
      due_today: Borrowing.where(due_date: today..(today + 3.days), status: :borrowed).count,
      overdue_books_count: Borrowing.overdue.count,
      top_genres: Book.group(:genre).order(Arel.sql('count_all desc')).limit(5).count,
      recent_borrowings: Borrowing.order(created_at: :desc).limit(5).includes(:book, :user).as_json(include: { book: { only: [:id, :title] }, user: { only: [:id, :email, :first_name, :last_name] } })
    }

    render json: data
  end

  def member
    return render json: { error: 'Forbidden' }, status: :forbidden unless current_user.member?

    # Aggregations for member dashboard
    today = Date.current

    # Top books by total borrowings (global, not only current user)
    top_books_rows = Book
      .left_joins(:borrowings)
      .group('books.id')
      .order(Arel.sql('COUNT(borrowings.id) DESC'))
      .limit(5)
      .pluck('books.id', 'books.title', 'books.author', 'books.genre', Arel.sql('COUNT(borrowings.id) AS borrowings_count'))

    # Build can_borrow map without relying on symbol pluck for SQL aliases
    can_borrow_map = Book.with_can_borrow_for(current_user)
      .where(id: top_books_rows.map(&:first))
      .map { |b| [b.id, !!b[:can_borrow]] }
      .to_h
    top_books = top_books_rows.map do |id, title, author, genre, count|
      { id: id, title: title, author: author, genre: genre, borrowings_count: count.to_i, can_borrow: !!can_borrow_map[id] }
    end

    overdue_count = current_user.borrowings.overdue.count
    due_soon_count = current_user.borrowings.where(status: :borrowed).where(due_date: today..(today + 3.days)).count

    data = {
      current_borrowings: current_user.borrowings.where(status: [:borrowed, :overdue]).includes(:book).as_json(include: :book),
      history: current_user.borrowings.order(created_at: :desc).limit(20).includes(:book).as_json(include: :book),
      top_books: top_books,
      alerts: {
        overdue_count: overdue_count,
        due_soon_count: due_soon_count
      }
    }

    render json: data
  end
end
