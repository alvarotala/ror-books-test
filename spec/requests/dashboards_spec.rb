require 'rails_helper'

RSpec.describe "Dashboards API", type: :request do
  it 'member dashboard returns data and librarian is forbidden' do
    member = create(:user, :member)
    sign_in_as(member)
    get "/dashboard/member", headers: { 'ACCEPT' => 'application/json' }
    expect(response).to have_http_status(:ok)
    expect(json).to have_key('alerts')
    expect(json).to have_key('top_books')

    sign_out
    librarian = create(:user, :librarian)
    sign_in_as(librarian)
    get "/dashboard/member", headers: { 'ACCEPT' => 'application/json' }
    expect(response).to have_http_status(:forbidden)
  end

  it 'librarian dashboard returns aggregation' do
    librarian = create(:user, :librarian)
    sign_in_as(librarian)
    get "/dashboard/librarian", headers: { 'ACCEPT' => 'application/json' }
    expect(response).to have_http_status(:ok)
    expect(json).to include('total_books', 'currently_borrowed', 'due_today', 'members_with_overdue')
  end
end


