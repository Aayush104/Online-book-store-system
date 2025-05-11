namespace Online_Bookstore_System.Dto.ReviewDto
{
    public class DoReviewDto
    {
        public string BookId { get; set; }

        public int? Star { get; set; }
        public string Comment { get; set; }   
    }
}
