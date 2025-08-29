class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  skip_forgery_protection if Rails.env.test?
  before_action :authenticate_user!, unless: :devise_controller?

  # Render JSON errors in a consistent structure
  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: 'Not Found' }, status: :not_found
  end

  rescue_from ActiveRecord::RecordInvalid do |e|
    render json: { error: 'Unprocessable Entity', details: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  private
end
