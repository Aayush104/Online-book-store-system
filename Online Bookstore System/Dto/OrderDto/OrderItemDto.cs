namespace Online_Bookstore_System.Dto.OrderDto
{
    public class OrderItemDto
    {
        public string BookId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
