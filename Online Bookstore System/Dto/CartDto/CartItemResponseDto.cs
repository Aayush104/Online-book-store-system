namespace Online_Bookstore_System.Dto.CartDto
{
    public class CartItemResponseDto
    {
        public string BookId { get; set; }  
        public string Title { get; set; }
        public string Author { get; set; }
        public string ImageUrl { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public DateTime AddedDate { get; set; }
    }
}
