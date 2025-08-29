class BorrowingsController < ApplicationController
  before_action :set_book, only: [:create]
  before_action :set_borrowing, only: [:return_book]

  def index
    scope = current_user.librarian? ? Borrowing.all : current_user.borrowings
    scope = scope.includes(:book, :user)

    # Status filter: borrowed | returned | overdue | all (default)
    status_param = params[:status].presence
    if status_param.present? && status_param != 'all' && Borrowing.statuses.key?(status_param)
      scope = scope.where(status: status_param)
    end

    # Sorting: default borrowed_at DESC; if sort=due_date then due_date ASC unless direction provided
    sort_param = params[:sort].presence
    direction_param = params[:direction].to_s.downcase
    direction = %w[asc desc].include?(direction_param) ? direction_param.to_sym : nil

    if sort_param == 'due_date'
      dir = (direction || :asc)
      scope = scope.order(due_date: dir, id: dir)
    else
      dir = (direction || :desc)
      scope = scope.order(borrowed_at: dir, id: dir)
    end
    page = params[:page].to_i
    page = 1 if page <= 0
    per_page = 25
    items = scope.limit(per_page).offset((page - 1) * per_page)
    render json: items.as_json(include: { book: {}, user: { only: [:id, :email, :first_name, :last_name] } })
  end

  def create
    borrowing = Borrowing.create!(user: current_user, book: @book)
    render json: borrowing, status: :created
  end

  def return_book
    if current_user.librarian? || @borrowing.user_id == current_user.id
      @borrowing.return!
      render json: @borrowing
    else
      render json: { error: 'Forbidden' }, status: :forbidden
    end
  end

  private

  def set_book
    @book = Book.find(params[:book_id])
  end

  def set_borrowing
    @borrowing = Borrowing.find(params[:id])
  end
end
