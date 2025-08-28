Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users

  resources :books

  resources :borrowings, only: [:index, :create] do
    member do
      post :return_book
    end
  end

  namespace :dashboard do
    get :librarian, to: "/dashboards#librarian"
    get :member, to: "/dashboards#member"
  end

  root to: "books#index"
end
