class BorrowingsController < ApplicationController
  before_action :set_book, only: [:create]
  before_action :set_borrowing, only: [:return_book]

  def index
    scope = current_user.librarian? ? Borrowing.all : current_user.borrowings
    render json: scope.includes(:book).order(created_at: :desc)
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
