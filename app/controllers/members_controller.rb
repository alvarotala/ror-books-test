class MembersController < ApplicationController
  before_action :require_librarian!
  before_action :set_member, only: [:show, :update, :destroy]

  def index
    scope = User.where(role: :member)
    q = params[:q].to_s.strip
    if q.present?
      pattern = "%#{q}%"
      scope = scope.where("email ILIKE ? OR first_name ILIKE ? OR last_name ILIKE ?", pattern, pattern, pattern)
    end
    render json: scope.order(created_at: :desc).select(:id, :email, :first_name, :last_name, :role, :created_at, :updated_at)
  end

  def show
    render json: @member.as_json(only: [:id, :email, :first_name, :last_name, :role, :created_at, :updated_at])
  end

  def create
    user = User.new(member_params)
    user.role = :member
    user.save!
    render json: user.as_json(only: [:id, :email, :first_name, :last_name, :role, :created_at, :updated_at]), status: :created
  end

  def update
    # Prevent changing role away from member through this controller
    attrs = member_params.to_h.symbolize_keys
    attrs.delete(:role)
    @member.update!(attrs)
    render json: @member.as_json(only: [:id, :email, :first_name, :last_name, :role, :created_at, :updated_at])
  end

  def destroy
    @member.destroy!
    head :no_content
  end

  private

  def set_member
    @member = User.member.find(params[:id])
  end

  def member_params
    params.require(:member).permit(:email, :password, :first_name, :last_name)
  end

  def require_librarian!
    render json: { error: 'Forbidden' }, status: :forbidden unless current_user&.librarian?
  end
end


