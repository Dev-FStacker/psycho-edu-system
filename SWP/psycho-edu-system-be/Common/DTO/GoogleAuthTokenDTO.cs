using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class GoogleAuthTokenDTO
    {
        public required string IdToken { get; set; }
    }
}
