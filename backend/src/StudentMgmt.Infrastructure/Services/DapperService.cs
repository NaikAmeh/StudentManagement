using Microsoft.Extensions.Configuration;
using MySqlConnector;
using System.Data;
using StudentManagement.Application.Features.Students;
using Newtonsoft.Json;
using Dapper;
using StudentManagement.Application.Interfaces.Services;

namespace StudentMgmt.Infrastructure.Services
{
    public class DapperService : IDapperService
    {
        private readonly string _connectionString;

        public DapperService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' not found");
        }

        public async Task<int> BulkInsertUpdateStudentsAsync(IEnumerable<VmStudentBulkInsert> students)
        {
            using (var connection = new MySqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                // Serialize the collection to JSON
                string studentsJson = JsonConvert.SerializeObject(students);

                // Execute the stored procedure
                var parameters = new DynamicParameters();
                parameters.Add("@studentsJson", studentsJson, DbType.String);

                return await connection.ExecuteAsync(
                    "sp_BulkInsertUpdateStudents",
                    parameters,
                    commandType: CommandType.StoredProcedure);
            }
        }
    }
}
