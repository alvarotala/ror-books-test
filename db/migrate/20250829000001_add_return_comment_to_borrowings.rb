class AddReturnCommentToBorrowings < ActiveRecord::Migration[7.1]
  def change
    add_column :borrowings, :return_comment, :text
  end
end


