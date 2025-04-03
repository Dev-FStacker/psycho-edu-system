using System;
using System.ComponentModel.DataAnnotations;

namespace DAL.Entities
{
    public class DimensionHealth
    {
        [Key]
        public int DimensionId { get; set; }

        [Required]
        public string DimensionName { get; set; }

        public DateTime CreateAt { get; set; }

        public virtual ICollection<BlogPost> BlogPosts { get; set; }
    }
}
