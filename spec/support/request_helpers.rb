module RequestHelpers
  def json
    JSON.parse(response.body)
  end

  def post_json(path, params)
    post path, params: params, as: :json, headers: { 'ACCEPT' => 'application/json' }
  end

  def patch_json(path, params)
    patch path, params: params, as: :json, headers: { 'ACCEPT' => 'application/json' }
  end

  def delete_json(path)
    delete path, headers: { 'ACCEPT' => 'application/json' }
  end

  def sign_in_as(user)
    login_as(user, scope: :user)
  end

  def sign_out
    logout(:user)
  end
end

RSpec.configure do |config|
  config.include RequestHelpers, type: :request
end


