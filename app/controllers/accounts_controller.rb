class AccountsController < ApplicationController
  # All actions require authentication via ApplicationController

  def show
    render json: { user: current_user.as_json(only: [:id, :email, :first_name, :last_name, :role]) }
  end

  def update
    if current_user.update(account_params)
      render json: { user: current_user.as_json(only: [:id, :email, :first_name, :last_name, :role]) }
    else
      render json: { error: 'Unprocessable Entity', details: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def password
    unless current_user.valid_password?(params[:current_password].to_s)
      return render json: { error: 'Current password is incorrect' }, status: :unprocessable_entity
    end

    current_user.password = params[:password]
    current_user.password_confirmation = params[:password_confirmation]

    if current_user.save
      render json: { ok: true }
    else
      render json: { error: 'Unprocessable Entity', details: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def account_params
    params.require(:user).permit(:first_name, :last_name, :email)
  end
end


