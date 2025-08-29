require 'rails_helper'

RSpec.describe "Borrowings API", type: :request do
  it 'member can borrow once and cannot borrow duplicate active' do
    member = create(:user, :member)
    book = create(:book, total_copies: 1)
    sign_in_as(member)

    post_json "/borrowings", { book_id: book.id }
    expect(response).to have_http_status(:created)

    post_json "/borrowings", { book_id: book.id }
    expect(response).to have_http_status(:unprocessable_entity)
  end

  it 'librarian can mark as returned with comment' do
    member = create(:user, :member)
    librarian = create(:user, :librarian)
    book = create(:book, total_copies: 1)
    sign_in_as(member)
    post_json "/borrowings", { book_id: book.id }
    expect(response).to have_http_status(:created)
    borrowing_id = json['id']

    sign_out
    sign_in_as(librarian)

    post_json "/borrowings/#{borrowing_id}/return_book", { comment: 'OK' }
    expect(response).to have_http_status(:ok)
    expect(json['status']).to eq('returned')
    expect(json['return_comment']).to eq('OK')
  end
end


