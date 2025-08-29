class Book < ApplicationRecord
  has_many :borrowings, dependent: :destroy

  validates :title, :author, :genre, :isbn, presence: true
  validates :isbn, uniqueness: true
  validates :total_copies, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  def available_copies
    active_borrowings = borrowings.where(status: :borrowed).where(returned_at: nil).count
    total_copies - active_borrowings
  end

  # Virtual attribute populated by with_can_borrow_for scope when selected
  attribute :can_borrow, :boolean, default: false

  # Returns books with a computed boolean column `can_borrow` for the given user
  # Computation rules (in SQL):
  # - user must be a member
  # - available copies > 0 (total_copies - active_borrowings)
  # - user has no active borrowing for that book
  scope :with_can_borrow_for, ->(user) do
    user_id = user&.id || 0
    is_member_sql = user&.member? ? 'TRUE' : 'FALSE'

    active_subquery = Borrowing
      .where(status: Borrowing.statuses[:borrowed], returned_at: nil)
      .group(:book_id)
      .select('book_id, COUNT(*) AS active_count')

    user_active_subquery = Borrowing
      .where(user_id: user_id, status: Borrowing.statuses[:borrowed], returned_at: nil)
      .select('DISTINCT book_id')

    joins("LEFT JOIN (#{active_subquery.to_sql}) AS active ON active.book_id = books.id")
      .joins("LEFT JOIN (#{user_active_subquery.to_sql}) AS user_active ON user_active.book_id = books.id")
      .select('books.*')
      .select(Arel.sql("CASE WHEN (#{is_member_sql}) AND (COALESCE(active.active_count, 0) < books.total_copies) AND user_active.book_id IS NULL THEN TRUE ELSE FALSE END AS can_borrow"))
  end

  # Search scope for filtering books by title, author, or genre
  scope :search, ->(query) do
    return all unless query.present?
    
    pattern = "%#{query.strip}%"
    where("title ILIKE ? OR author ILIKE ? OR genre ILIKE ?", pattern, pattern, pattern)
  end

  # Returns top books by total borrowings count
  scope :top_by_borrowings, ->(limit = 5) do
    left_joins(:borrowings)
      .group('books.id')
      .order(Arel.sql('COUNT(borrowings.id) DESC'))
      .limit(limit)
      .pluck('books.id', 'books.title', 'books.author', 'books.genre', Arel.sql('COUNT(borrowings.id) AS borrowings_count'))
  end
end
