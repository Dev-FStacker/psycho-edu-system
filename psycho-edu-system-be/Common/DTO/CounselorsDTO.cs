﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class CounselorsDTO
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; }
        public string Phone {  get; set; }
        public string Email { get; set; }
        public DateTime BirthDay { get; set; }
        public string GoogleMeetURL { get; set; }
        public string Gender { get; set; }
        public string Address { get; set; }
    }
}
