class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :borrowings, dependent: :destroy

  enum :role, { librarian: 0, member: 1 }

  validates :role, presence: true

  scope :search_by_name_or_email, ->(query) {
    return all if query.blank?
    
    pattern = "%#{query.strip}%"
    where("email ILIKE ? OR first_name ILIKE ? OR last_name ILIKE ?", pattern, pattern, pattern)
  }
end
