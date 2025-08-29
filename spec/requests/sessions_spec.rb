require 'rails_helper'

RSpec.describe "Sessions", type: :request do
  it 'logs in and returns current user, then logs out' do
    user = create(:user, :member)

    post_json "/session", { email: user.email, password: 'password123' }
    # debug
    # puts "status=#{response.status} body=#{response.body}"
    expect(response).to have_http_status(:ok)
    expect(json['ok']).to be true
    expect(json['user']).to include('email' => user.email, 'role' => 'member')

    get "/session/current"
    expect(response).to have_http_status(:ok)
    expect(json['user']).to include('email' => user.email)

    delete_json "/session"
    expect(response).to have_http_status(:no_content)

    get "/session/current"
    expect(response).to have_http_status(:ok)
    expect(json['user']).to be_nil
  end

  it 'rejects invalid credentials' do
    user = create(:user)
    post_json "/session", { email: user.email, password: 'wrong' }
    # puts "status=#{response.status} body=#{response.body}"
    expect(response).to have_http_status(:unauthorized)
  end
end


