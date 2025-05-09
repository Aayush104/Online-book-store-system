using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Online_Bookstore_System.Model
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }

        public string Status { get; set; } = "Pending";

       
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

       
        public string ClaimCode { get; set; }

        public decimal TotalAmount { get; set; }
        public decimal DiscountApplied { get; set; }

        public DateTime? OrderCompletedDate { get; set; }

        [Required]
        public string UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual ApplicationUser? User { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
