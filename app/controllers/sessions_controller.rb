class SessionsController < ApplicationController
  skip_before_action :authenticate_user!, only: [:create, :csrf, :current, :preflight]

  def create
    user = User.find_for_authentication(email: params[:email])
    if user&.valid_password?(params[:password])
      sign_in(user)
      render json: { ok: true, user: user.as_json(only: [:id, :email, :first_name, :last_name, :role]) }
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  def destroy
    sign_out(current_user)
    head :no_content
  end

  def current
    if current_user
      render json: { user: current_user.as_json(only: [:id, :email, :first_name, :last_name, :role]) }
    else
      render json: { user: nil }
    end
  end

  def csrf
    render json: { csrfToken: form_authenticity_token }
  end

  # Handle CORS preflight for /session
  def preflight
    head :no_content
  end
end


