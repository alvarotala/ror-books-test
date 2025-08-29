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
    page = params[:page].to_i
    page = 1 if page <= 0
    per_page = 25
    members = scope.order(created_at: :desc).limit(per_page).offset((page - 1) * per_page)
    render json: members.select(:id, :email, :first_name, :last_name, :role, :created_at, :updated_at)
  end

  def show
    render json: @member.as_json(only: [:id, :email, :first_name, :last_name, :role, :created_at, :updated_at])
  end

  def create
    user = User.new(member_params)
    user.role = :member
    if user.save
      render json: user.as_json(only: [:id, :email, :first_name, :last_name, :role, :created_at, :updated_at]), status: :created
    else
      render json: { errors: user.errors }, status: :unprocessable_entity
    end
  end

  def update
    # Prevent changing role away from member through this controller
    attrs = member_params.to_h.symbolize_keys
    attrs.delete(:role)
    if @member.update(attrs)
      render json: @member.as_json(only: [:id, :email, :first_name, :last_name, :role, :created_at, :updated_at])
    else
      render json: { errors: @member.errors }, status: :unprocessable_entity
    end
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


