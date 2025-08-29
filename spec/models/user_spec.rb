require 'rails_helper'

RSpec.describe User, type: :model do
  it 'has a valid factory' do
    expect(build(:user)).to be_valid
  end

  it 'requires a role' do
    user = build(:user, role: nil)
    expect(user).not_to be_valid
    expect(user.errors[:role]).to be_present
  end

  it 'supports roles enum helpers' do
    librarian = build(:user, :librarian)
    member = build(:user, :member)
    expect(librarian.librarian?).to be true
    expect(member.member?).to be true
  end

  it 'has many borrowings' do
    user = create(:user)
    book = create(:book)
    create(:borrowing, user: user, book: book)
    expect(user.borrowings.count).to eq(1)
  end
end
