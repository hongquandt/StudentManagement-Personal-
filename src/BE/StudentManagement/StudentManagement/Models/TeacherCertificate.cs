using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class TeacherCertificate
{
    public int CertificateId { get; set; }

    public int TeacherId { get; set; }

    public string CertificateName { get; set; } = null!;

    public string? IssuedBy { get; set; }

    public DateOnly? IssueDate { get; set; }

    public string? CertificateImage { get; set; }

    public string? Description { get; set; }

    public virtual Teacher Teacher { get; set; } = null!;
}
