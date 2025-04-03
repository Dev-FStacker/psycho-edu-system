using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class SurveyResponse
    {
        [Key]
        public Guid SurveyResponseId { get; set; }
        public Guid SurveyTakerId { get; set; } 
        public Guid SurveyTargetId { get; set; } 
        public int HealthPoints { get; set; }
        public DateTime CreateAt { get; set; }

        [ForeignKey("SurveyTakerId")]
        public User SurveyTaker { get; set; }
        [ForeignKey("SurveyTargetId")]
        public User SurveyTarget { get; set; }
        public Guid SurveyId { get; set; }
        public Survey Survey { get; set; }
        public virtual ICollection<MentalHealthPointDetail> HealthPointsDetail { get; set; }
    }
}
