class Borrowing < ApplicationRecord
  belongs_to :user
  belongs_to :book

  enum :status, { borrowed: 0, returned: 1, overdue: 2 }

  validates :borrowed_at, :due_date, presence: true
  validates :status, presence: true
  validate :prevent_duplicate_active_borrowing, on: :create
  validate :copies_available_to_borrow, on: :create

  before_validation :set_defaults, on: :create

  scope :active, -> { where(status: :borrowed, returned_at: nil) }

  def return!(comment: nil)
    update!(status: :returned, returned_at: Time.current, return_comment: comment.presence)
  end

  private

  def set_defaults
    self.borrowed_at ||= Time.current
    self.due_date ||= 14.days.from_now.to_date
    self.status ||= :borrowed
  end

  def prevent_duplicate_active_borrowing
    if Borrowing.where(user_id: user_id, book_id: book_id).active.exists?
      errors.add(:base, "User already has an active borrowing for this book")
    end
  end

  def copies_available_to_borrow
    if book.present? && book.available_copies <= 0
      errors.add(:base, "No available copies for this book")
    end
  end
end
