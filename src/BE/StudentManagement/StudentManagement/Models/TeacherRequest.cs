using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class TeacherRequest
{
    public int RequestId { get; set; }

    public int TeacherId { get; set; }

    public string RequestType { get; set; } = null!;

    public string Content { get; set; } = null!;

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Teacher Teacher { get; set; } = null!;
}
