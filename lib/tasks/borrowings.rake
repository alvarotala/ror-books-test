# frozen_string_literal: true

namespace :db do
  desc "Seed sample borrowings with different statuses and dates (idempotent)"
  task seed_borrowings: :environment do
    puts "Seeding sample borrowings..."
    
    # Ensure we have users and books to work with
    users = User.where(role: :member)
    books = Book.all
    
    if users.empty?
      puts "No member users found. Please run 'rails db:seed' first to create users."
      return
    end
    
    if books.empty?
      puts "No books found. Please run 'rails db:seed_bestsellers' first to create books."
      return
    end
    
    # Clear existing borrowings to avoid conflicts
    Borrowing.destroy_all
    puts "Cleared existing borrowings."
    
    borrowings_created = 0
    
    # Create borrowings with different statuses and dates
    users.each do |user|
      # Each user will borrow multiple books
      books.sample(rand(3..6)).each do |book|
        # Generate different borrowing scenarios
        case rand(1..4)
        when 1
          # Currently borrowed (within due date)
          borrowed_at = rand(1..10).days.ago
          due_date = rand(1..14).days.from_now.to_date
          status = :borrowed
          returned_at = nil
          return_comment = nil
          
        when 2
          # Recently returned
          borrowed_at = rand(15..30).days.ago
          due_date = borrowed_at.to_date + 14.days
          status = :returned
          returned_at = rand(1..5).days.ago
          return_comment = ["Great book!", "Interesting read", "Would recommend", "Good condition", nil].sample
          
        when 3
          # Overdue
          borrowed_at = rand(20..40).days.ago
          due_date = borrowed_at.to_date + 14.days
          status = :overdue
          returned_at = nil
          return_comment = nil
          
        when 4
          # Returned late (overdue but eventually returned)
          borrowed_at = rand(25..45).days.ago
          due_date = borrowed_at.to_date + 14.days
          status = :returned
          returned_at = rand(1..10).days.ago
          return_comment = ["Returned late", "Sorry for the delay", "Lost track of time", "Busy schedule", nil].sample
        end
        
        # Create the borrowing
        borrowing = Borrowing.create!(
          user: user,
          book: book,
          borrowed_at: borrowed_at,
          due_date: due_date,
          returned_at: returned_at,
          status: status,
          return_comment: return_comment
        )
        
        borrowings_created += 1
        
        # Print progress for every 10 borrowings
        if borrowings_created % 10 == 0
          puts "Created #{borrowings_created} borrowings..."
        end
      end
    end
    
    # Create some additional borrowings with specific date ranges for testing
    puts "Creating borrowings with specific date ranges..."
    
    # Historical borrowings (last 6 months)
    (1..6).each do |month|
      month_ago = month.months.ago
      users.sample(rand(2..4)).each do |user|
        book = books.sample
        borrowed_at = month_ago + rand(1..28).days
        due_date = borrowed_at.to_date + 14.days
        
        if due_date < Date.current
          # Past due date - either returned or overdue
          if rand < 0.7 # 70% chance of being returned
            status = :returned
            returned_at = due_date + rand(1..10).days
            return_comment = ["Historical return", "Old borrowing", nil].sample
          else
            status = :overdue
            returned_at = nil
            return_comment = nil
          end
        else
          # Still within due date
          status = :borrowed
          returned_at = nil
          return_comment = nil
        end
        
        Borrowing.create!(
          user: user,
          book: book,
          borrowed_at: borrowed_at,
          due_date: due_date,
          returned_at: returned_at,
          status: status,
          return_comment: return_comment
        )
        
        borrowings_created += 1
      end
    end
    
    # Future borrowings (next 2 months) - for testing upcoming due dates
    puts "Creating future borrowings..."
    (1..2).each do |month|
      month_from_now = month.months.from_now
      users.sample(rand(1..3)).each do |user|
        book = books.sample
        borrowed_at = month_from_now - rand(1..14).days
        due_date = month_from_now + rand(1..7).days
        
        Borrowing.create!(
          user: user,
          book: book,
          borrowed_at: borrowed_at,
          due_date: due_date,
          status: :borrowed,
          returned_at: nil,
          return_comment: nil
        )
        
        borrowings_created += 1
      end
    end
    
    puts "Successfully created #{borrowings_created} sample borrowings!"
    puts "Status breakdown:"
    puts "  Borrowed: #{Borrowing.borrowed.count}"
    puts "  Returned: #{Borrowing.returned.count}"
    puts "  Overdue: #{Borrowing.overdue.count}"
    puts "  Total: #{Borrowing.count}"
  end
end
