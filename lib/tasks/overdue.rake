# frozen_string_literal: true

namespace :overdue do
  desc "Manually trigger mark_overdue_books service"
  task mark_overdue: :environment do
    puts "Triggering mark_overdue_books service..."
    
    begin
      result = OverdueService.mark_overdue_books
      
      if result[:count] > 0
        puts "Successfully marked #{result[:count]} books as overdue"
      else
        puts "No overdue books found to mark"
      end
      
    rescue => e
      puts "Error occurred: #{e.message}"
      puts e.backtrace.first(5).join("\n")
      exit 1
    end
  end
end
