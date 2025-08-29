require 'rails_helper'

RSpec.describe "Books API", type: :request do
  let!(:book) { create(:book, title: 'Dune', author: 'Frank Herbert', isbn: 'ISBN-1', total_copies: 1) }

  it 'lists books with can_borrow flag for member' do
    user = create(:user, :member)
    sign_in_as(user)

    get "/books", headers: { 'ACCEPT' => 'application/json' }
    expect(response).to have_http_status(:ok)
    expect(json.first).to include('title' => 'Dune')
    expect(json.first).to have_key('can_borrow')
  end

  it 'forbids member from creating books' do
    user = create(:user, :member)
    sign_in_as(user)
    post_json "/books", { book: { title: 'New', author: 'A', genre: 'G', isbn: 'X', total_copies: 1 } }
    expect(response).to have_http_status(:forbidden)
  end

  it 'allows librarian to CRUD books' do
    user = create(:user, :librarian)
    sign_in_as(user)

    post_json "/books", { book: { title: 'New Book', author: 'Auth', genre: 'Sci-Fi', isbn: 'NEW-1', total_copies: 2 } }
    expect(response).to have_http_status(:created)
    created_id = json['id']

    patch_json "/books/#{created_id}", { book: { author: 'Updated' } }
    expect(response).to have_http_status(:ok)
    expect(json['author']).to eq('Updated')

    delete_json "/books/#{created_id}"
    expect(response).to have_http_status(:no_content)
  end
end


