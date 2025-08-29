require 'rails_helper'

RSpec.describe Borrowing, type: :model do
  it 'has a valid factory' do
    expect(build(:borrowing)).to be_valid
  end

  it 'sets defaults on create' do
    borrowing = create(:borrowing)
    expect(borrowing.borrowed_at).to be_present
    expect(borrowing.due_date).to be_present
    expect(borrowing.status).to eq('borrowed')
  end

  it 'prevents duplicate active borrowing for the same user and book' do
    borrowing = create(:borrowing)
    dup = build(:borrowing, user: borrowing.user, book: borrowing.book)
    expect(dup).not_to be_valid
    expect(dup.errors.full_messages.join).to match(/active borrowing/i)
  end

  it 'requires available copies to borrow' do
    book = create(:book, total_copies: 1)
    member1 = create(:user)
    member2 = create(:user)
    create(:borrowing, user: member1, book: book)
    invalid = build(:borrowing, user: member2, book: book)
    expect(invalid).not_to be_valid
    expect(invalid.errors.full_messages.join).to match(/No available copies/i)
  end

  it 'return! updates status, timestamp and optional comment' do
    borrowing = create(:borrowing)
    borrowing.return!(comment: 'Good condition')
    expect(borrowing.status).to eq('returned')
    expect(borrowing.returned_at).to be_present
    expect(borrowing.return_comment).to eq('Good condition')
  end
end
