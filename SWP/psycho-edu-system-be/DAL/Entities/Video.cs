using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class Video
    {
        [Key]
        public Guid VideoId { get; set; }
        public string Content { get; set; }
        public string Title { get; set; }
        public string ContentType { get; set; }
        public DateTime? UpdateAt { get; set; }
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime? CreateAt { get; set; }
    }
}

