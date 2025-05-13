using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static DAL.Entities.DimensionHealth;

namespace DAL.Entities
{
    public class MentalHealthPointDetail
    {
        [Key]
        public Guid MentalHPDetailId { get; set; }

        public int DimensionId { get; set; } 
        public int HealthPoints { get; set; }
        public string DimensionName { get; set; }
        public SurveyResponse SurveyResponse { get; set; }
        public Guid SurveyResponseId { get; set; }
        [ForeignKey("DimensionId")]
        public DimensionHealth Dimension { get; set; }
        public DateTime CreateAt { get; set; }
    }
}
