class Book < ApplicationRecord
  has_many :borrowings, dependent: :destroy

  validates :title, :author, :genre, :isbn, presence: true
  validates :isbn, uniqueness: true
  validates :total_copies, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  def available_copies
    active_borrowings = borrowings.where(status: :borrowed).where(returned_at: nil).count
    total_copies - active_borrowings
  end
end
