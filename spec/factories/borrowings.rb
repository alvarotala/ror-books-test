FactoryBot.define do
  factory :borrowing do
    association :user, factory: [:user, :member]
    association :book
    borrowed_at { Time.current }
    due_date { 14.days.from_now.to_date }
    status { :borrowed }

    trait :returned do
      status { :returned }
      returned_at { Time.current }
    end

    trait :overdue do
      status { :overdue }
      returned_at { nil }
      due_date { 1.day.ago.to_date }
    end
  end
end
