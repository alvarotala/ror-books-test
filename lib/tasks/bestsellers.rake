# frozen_string_literal: true

namespace :db do
  desc "Seed 100 bestseller books with fictional ISBNs (idempotent)"
  task seed_bestsellers: :environment do
    bestsellers = [
      { title: "Don Quixote", author: "Miguel de Cervantes", genre: "Classic" },
      { title: "A Tale of Two Cities", author: "Charles Dickens", genre: "Classic" },
      { title: "The Lord of the Rings", author: "J. R. R. Tolkien", genre: "Fantasy" },
      { title: "The Little Prince", author: "Antoine de Saint-Exupéry", genre: "Fiction" },
      { title: "The Hobbit", author: "J. R. R. Tolkien", genre: "Fantasy" },
      { title: "And Then There Were None", author: "Agatha Christie", genre: "Mystery" },
      { title: "Dream of the Red Chamber", author: "Cao Xueqin", genre: "Classic" },
      { title: "She: A History of Adventure", author: "H. Rider Haggard", genre: "Adventure" },
      { title: "The Lion, the Witch and the Wardrobe", author: "C. S. Lewis", genre: "Fantasy" },
      { title: "The Da Vinci Code", author: "Dan Brown", genre: "Thriller" },
      { title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction" },
      { title: "The Catcher in the Rye", author: "J. D. Salinger", genre: "Fiction" },
      { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", genre: "Fiction" },
      { title: "The Name of the Rose", author: "Umberto Eco", genre: "Mystery" },
      { title: "Lolita", author: "Vladimir Nabokov", genre: "Fiction" },
      { title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction" },
      { title: "Pride and Prejudice", author: "Jane Austen", genre: "Classic" },
      { title: "The Kite Runner", author: "Khaled Hosseini", genre: "Fiction" },
      { title: "Life of Pi", author: "Yann Martel", genre: "Fiction" },
      { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", genre: "Thriller" },
      { title: "The Hunger Games", author: "Suzanne Collins", genre: "Dystopian" },
      { title: "Catching Fire", author: "Suzanne Collins", genre: "Dystopian" },
      { title: "Mockingjay", author: "Suzanne Collins", genre: "Dystopian" },
      { title: "Twilight", author: "Stephenie Meyer", genre: "Paranormal Romance" },
      { title: "New Moon", author: "Stephenie Meyer", genre: "Paranormal Romance" },
      { title: "Eclipse", author: "Stephenie Meyer", genre: "Paranormal Romance" },
      { title: "Breaking Dawn", author: "Stephenie Meyer", genre: "Paranormal Romance" },
      { title: "Fifty Shades of Grey", author: "E. L. James", genre: "Romance" },
      { title: "Fifty Shades Darker", author: "E. L. James", genre: "Romance" },
      { title: "Fifty Shades Freed", author: "E. L. James", genre: "Romance" },
      { title: "The Fault in Our Stars", author: "John Green", genre: "Young Adult" },
      { title: "The Help", author: "Kathryn Stockett", genre: "Fiction" },
      { title: "The Book Thief", author: "Markus Zusak", genre: "Historical Fiction" },
      { title: "Gone Girl", author: "Gillian Flynn", genre: "Thriller" },
      { title: "The Shining", author: "Stephen King", genre: "Horror" },
      { title: "It", author: "Stephen King", genre: "Horror" },
      { title: "The Stand", author: "Stephen King", genre: "Horror" },
      { title: "Misery", author: "Stephen King", genre: "Horror" },
      { title: "1984", author: "George Orwell", genre: "Dystopian" },
      { title: "Animal Farm", author: "George Orwell", genre: "Satire" },
      { title: "Brave New World", author: "Aldous Huxley", genre: "Dystopian" },
      { title: "Fahrenheit 451", author: "Ray Bradbury", genre: "Dystopian" },
      { title: "Moby-Dick", author: "Herman Melville", genre: "Classic" },
      { title: "War and Peace", author: "Leo Tolstoy", genre: "Classic" },
      { title: "Crime and Punishment", author: "Fyodor Dostoevsky", genre: "Classic" },
      { title: "Anna Karenina", author: "Leo Tolstoy", genre: "Classic" },
      { title: "The Brothers Karamazov", author: "Fyodor Dostoevsky", genre: "Classic" },
      { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic" },
      { title: "Ulysses", author: "James Joyce", genre: "Classic" },
      { title: "The Sound and the Fury", author: "William Faulkner", genre: "Classic" },
      { title: "The Grapes of Wrath", author: "John Steinbeck", genre: "Classic" },
      { title: "Of Mice and Men", author: "John Steinbeck", genre: "Classic" },
      { title: "East of Eden", author: "John Steinbeck", genre: "Classic" },
      { title: "A Game of Thrones", author: "George R. R. Martin", genre: "Fantasy" },
      { title: "A Clash of Kings", author: "George R. R. Martin", genre: "Fantasy" },
      { title: "A Storm of Swords", author: "George R. R. Martin", genre: "Fantasy" },
      { title: "A Feast for Crows", author: "George R. R. Martin", genre: "Fantasy" },
      { title: "A Dance with Dragons", author: "George R. R. Martin", genre: "Fantasy" },
      { title: "Prince Caspian", author: "C. S. Lewis", genre: "Fantasy" },
      { title: "The Voyage of the Dawn Treader", author: "C. S. Lewis", genre: "Fantasy" },
      { title: "The Silver Chair", author: "C. S. Lewis", genre: "Fantasy" },
      { title: "The Horse and His Boy", author: "C. S. Lewis", genre: "Fantasy" },
      { title: "The Magician's Nephew", author: "C. S. Lewis", genre: "Fantasy" },
      { title: "The Last Battle", author: "C. S. Lewis", genre: "Fantasy" },
      { title: "The Silmarillion", author: "J. R. R. Tolkien", genre: "Fantasy" },
      { title: "The Picture of Dorian Gray", author: "Oscar Wilde", genre: "Classic" },
      { title: "Dracula", author: "Bram Stoker", genre: "Horror" },
      { title: "Frankenstein", author: "Mary Shelley", genre: "Horror" },
      { title: "Jane Eyre", author: "Charlotte Brontë", genre: "Classic" },
      { title: "Wuthering Heights", author: "Emily Brontë", genre: "Classic" },
      { title: "Les Misérables", author: "Victor Hugo", genre: "Classic" },
      { title: "The Hunchback of Notre-Dame", author: "Victor Hugo", genre: "Classic" },
      { title: "The Count of Monte Cristo", author: "Alexandre Dumas", genre: "Classic" },
      { title: "The Three Musketeers", author: "Alexandre Dumas", genre: "Classic" },
      { title: "The Old Man and the Sea", author: "Ernest Hemingway", genre: "Classic" },
      { title: "For Whom the Bell Tolls", author: "Ernest Hemingway", genre: "Classic" },
      { title: "The Sun Also Rises", author: "Ernest Hemingway", genre: "Classic" },
      { title: "The Stranger", author: "Albert Camus", genre: "Classic" },
      { title: "The Plague", author: "Albert Camus", genre: "Classic" },
      { title: "The Road", author: "Cormac McCarthy", genre: "Fiction" },
      { title: "No Country for Old Men", author: "Cormac McCarthy", genre: "Fiction" },
      { title: "Dune", author: "Frank Herbert", genre: "Science Fiction" },
      { title: "Foundation", author: "Isaac Asimov", genre: "Science Fiction" },
      { title: "Neuromancer", author: "William Gibson", genre: "Science Fiction" },
      { title: "Snow Crash", author: "Neal Stephenson", genre: "Science Fiction" },
      { title: "Ender's Game", author: "Orson Scott Card", genre: "Science Fiction" },
      { title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", genre: "Science Fiction" },
      { title: "The Color Purple", author: "Alice Walker", genre: "Fiction" },
      { title: "Beloved", author: "Toni Morrison", genre: "Fiction" },
      { title: "A Brief History of Time", author: "Stephen Hawking", genre: "Non-Fiction" },
      { title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-Fiction" },
      { title: "The Power of Habit", author: "Charles Duhigg", genre: "Non-Fiction" },
      { title: "Educated", author: "Tara Westover", genre: "Non-Fiction" },
      { title: "Becoming", author: "Michelle Obama", genre: "Non-Fiction" },
      { title: "The Girl on the Train", author: "Paula Hawkins", genre: "Thriller" },
      { title: "The Immortal Life of Henrietta Lacks", author: "Rebecca Skloot", genre: "Non-Fiction" },
      { title: "The Outsiders", author: "S. E. Hinton", genre: "Young Adult" },
      { title: "The Giver", author: "Lois Lowry", genre: "Young Adult" },
      { title: "The Handmaid's Tale", author: "Margaret Atwood", genre: "Dystopian" },
      { title: "The Princess Bride", author: "William Goldman", genre: "Fantasy" }
    ]

    created_count = 0
    updated_count = 0

    bestsellers.each_with_index do |book_attrs, index|
      # Generate a fictional but unique 13-digit ISBN (no checksum validation enforced in model)
      isbn = format("999%010d", index + 1) # e.g., 9990000000001, 9990000000002, ...

      record = Book.find_or_initialize_by(isbn: isbn)
      was_new_record = record.new_record?

      record.title = book_attrs[:title]
      record.author = book_attrs[:author]
      record.genre = book_attrs[:genre]
      record.total_copies = 10

      if record.changed?
        record.save!
        if was_new_record
          created_count += 1
        else
          updated_count += 1
        end
      end
    end

    puts "Seeded bestsellers: created=#{created_count}, updated=#{updated_count}, total=#{Book.where(isbn: (1..100).map { |i| format('999%010d', i) }).count}"
  end
end


