require 'rails_helper'

RSpec.describe Book, type: :model do
  it 'has a valid factory' do
    expect(build(:book)).to be_valid
  end

  it 'validates presence and uniqueness' do
    book = build(:book, title: nil, author: nil, genre: nil, isbn: nil)
    expect(book).not_to be_valid
    expect(book.errors[:title]).to be_present
    expect(book.errors[:author]).to be_present
    expect(book.errors[:genre]).to be_present
    expect(book.errors[:isbn]).to be_present

    create(:book, isbn: 'ABC')
    dup = build(:book, isbn: 'ABC')
    expect(dup).not_to be_valid
    expect(dup.errors[:isbn]).to be_present
  end

  it 'computes available_copies from active borrowings' do
    book = create(:book, total_copies: 2)
    user1 = create(:user)
    user2 = create(:user)

    create(:borrowing, user: user1, book: book)
    expect(book.available_copies).to eq(1)

    create(:borrowing, user: user2, book: book)
    expect(book.available_copies).to eq(0)
  end

  describe '.with_can_borrow_for' do
    it 'returns can_borrow true only when user is member, copies available, and no active borrowing by user' do
      member = create(:user, :member)
      librarian = create(:user, :librarian)
      book = create(:book, total_copies: 1)

      # Initially member can borrow
      row = Book.with_can_borrow_for(member).find(book.id)
      expect(!!row[:can_borrow]).to be true

      # Librarian should not be allowed
      row_lib = Book.with_can_borrow_for(librarian).find(book.id)
      expect(!!row_lib[:can_borrow]).to be false

      # After borrowing by the same member, cannot borrow again
      create(:borrowing, user: member, book: book)
      row2 = Book.with_can_borrow_for(member).find(book.id)
      expect(!!row2[:can_borrow]).to be false
    end
  end
end
