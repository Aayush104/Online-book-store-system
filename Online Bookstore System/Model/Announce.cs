﻿using System.ComponentModel.DataAnnotations;

namespace Online_Bookstore_System.Model
{
    public class Announce
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; }

        public bool Expired { get; set; } = false;

        public bool IsAnnounced { get; set; } = false;
        public DateTime AnnouncemnetDateTime { get; set; }
        public DateTime AnnouncemnetEndDateTime { get; set; }

      

    }
}
