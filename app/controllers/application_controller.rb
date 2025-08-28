class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  before_action :authenticate_user!
  before_action :set_default_format

  # Render JSON errors in a consistent structure
  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: 'Not Found' }, status: :not_found
  end

  rescue_from ActiveRecord::RecordInvalid do |e|
    render json: { error: 'Unprocessable Entity', details: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  private

  def set_default_format
    request.format = :json unless params[:format]
  end
end
