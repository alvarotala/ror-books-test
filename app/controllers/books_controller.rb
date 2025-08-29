class BooksController < ApplicationController
  before_action :require_librarian!, except: [:index, :show]
  before_action :set_book, only: [:show, :update, :destroy]

  def index
    respond_to do |format|
      format.json do
        scope = apply_search(Book.all)
        page = params[:page].to_i
        page = 1 if page <= 0
        per_page = 25
        books = scope.limit(per_page).offset((page - 1) * per_page)
        render json: books
      end
      format.html { render inline: "<h1>Books</h1><p>Use the API or build the frontend.</p>" }
    end
  end

  def show
    respond_to do |format|
      format.json { render json: @book }
      format.html { render inline: "<pre>#{ERB::Util.html_escape(@book.attributes.to_json)}</pre>" }
    end
  end

  def create
    book = Book.new(book_params)
    if book.save
      render json: book, status: :created
    else
      render json: { errors: book.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @book.update(book_params)
      render json: @book
    else
      render json: { errors: @book.errors }, status: :unprocessable_entity
    end
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
