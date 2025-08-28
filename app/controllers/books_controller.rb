class BooksController < ApplicationController
  before_action :require_librarian!, except: [:index, :show]
  before_action :set_book, only: [:show, :update, :destroy]

  def index
    books = apply_search(Book.all)
    render json: books
  end

  def show
    render json: @book
  end

  def create
    book = Book.create!(book_params)
    render json: book, status: :created
  end

  def update
    @book.update!(book_params)
    render json: @book
  end

  def destroy
    @book.destroy!
    head :no_content
  end

  private

  def set_book
    @book = Book.find(params[:id])
  end

  def book_params
    params.require(:book).permit(:title, :author, :genre, :isbn, :total_copies)
  end

  def apply_search(scope)
    q = params[:q].to_s.strip
    return scope unless q.present?

    pattern = "%#{q}%"
    scope.where("title ILIKE ? OR author ILIKE ? OR genre ILIKE ?", pattern, pattern, pattern)
  end

  def require_librarian!
    render json: { error: 'Forbidden' }, status: :forbidden unless current_user&.librarian?
  end
end
