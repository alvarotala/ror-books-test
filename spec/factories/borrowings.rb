FactoryBot.define do
  factory :borrowing do
    user { nil }
    book { nil }
    borrowed_at { "2025-08-28 23:42:27" }
    due_date { "2025-08-28" }
    returned_at { "2025-08-28 23:42:27" }
    status { 1 }
  end
end
