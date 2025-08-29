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
    expect(json).to include('total_books', 'currently_borrowed', 'due_today', 'overdue_books_count')
  end

  it 'mark_overdue endpoint allows librarians to trigger overdue check' do
    librarian = create(:user, :librarian)
    sign_in_as(librarian)
    
    post "/dashboard/mark_overdue", headers: { 'ACCEPT' => 'application/json' }
    expect(response).to have_http_status(:ok)
    expect(json).to have_key('success')
    expect(json['success']).to be true
  end

  it 'mark_overdue endpoint forbids non-librarians' do
    member = create(:user, :member)
    sign_in_as(member)
    
    post "/dashboard/mark_overdue", headers: { 'ACCEPT' => 'application/json' }
    expect(response).to have_http_status(:forbidden)
  end

  it 'mark_overdue endpoint requires authentication' do
    post "/dashboard/mark_overdue", headers: { 'ACCEPT' => 'application/json' }
    expect(response).to have_http_status(:unauthorized)
  end
end


