require 'rails_helper'

RSpec.describe "Members API", type: :request do
  it 'forbids non-librarian access' do
    member = create(:user, :member)
    sign_in_as(member)
    get "/members", headers: { 'ACCEPT' => 'application/json' }
    expect(response).to have_http_status(:forbidden)
  end

  it 'librarian can create, update, list, and delete a member' do
    librarian = create(:user, :librarian)
    sign_in_as(librarian)

    post_json "/members", { member: { email: 'newmember@example.com', password: 'password123', first_name: 'New', last_name: 'Member' } }
    expect(response).to have_http_status(:created)
    created_id = json['id']
    expect(json['role']).to eq('member')

    patch_json "/members/#{created_id}", { member: { first_name: 'Updated' } }
    expect(response).to have_http_status(:ok)
    expect(json['first_name']).to eq('Updated')

    get "/members", headers: { 'ACCEPT' => 'application/json' }
    expect(response).to have_http_status(:ok)
    expect(json.any? { |m| m['id'] == created_id }).to be true

    delete_json "/members/#{created_id}"
    expect(response).to have_http_status(:no_content)
  end
end


