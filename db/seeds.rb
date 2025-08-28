puts "Seeding demo users..."

User.find_or_create_by!(email: "librarian@example.com") do |u|
  u.first_name = "Libby"
  u.last_name  = "Rarian"
  u.role       = :librarian
  u.password   = "password123"
  u.password_confirmation = "password123"
end

User.find_or_create_by!(email: "member@example.com") do |u|
  u.first_name = "Megan"
  u.last_name  = "Member"
  u.role       = :member
  u.password   = "password123"
  u.password_confirmation = "password123"
end

puts "Done."
