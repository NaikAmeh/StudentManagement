namespace StudentManagement.Application.Features.Students
{
    public class StudentExportFilter
    {
        public string? Name { get; set; }
        public string? StudentIdentifier { get; set; }
        public int? StandardId { get; set; }
        public int? DivisionId { get; set; }
        public string? Address { get; set; }
    }
}