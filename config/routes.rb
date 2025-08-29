Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users

  # Auth/session helper JSON endpoints for frontend
  post "/session", to: "sessions#create"
  match "/session", to: "sessions#preflight", via: :options
  delete "/session", to: "sessions#destroy"
  get "/session/current", to: "sessions#current"
  get "/csrf", to: "sessions#csrf"

  resources :books

  resources :borrowings, only: [:index, :create] do
    member do
      post :return_book
    end
  end

  resources :members

  namespace :dashboard do
    get :librarian, to: "/dashboards#librarian"
    get :member, to: "/dashboards#member"
  end

  root to: "books#index"
end
