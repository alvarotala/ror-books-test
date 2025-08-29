FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }
    first_name { "Test" }
    last_name { "User" }
    role { :member }

    trait :member do
      role { :member }
    end

    trait :librarian do
      role { :librarian }
    end
  end
end
