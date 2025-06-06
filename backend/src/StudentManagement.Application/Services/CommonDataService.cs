﻿using AutoMapper;
using Microsoft.Extensions.Logging;
using StudentManagement.Application.Interfaces.Services;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using StudentManagement.Application.Features.Common.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace StudentManagement.Application.Services
{
    public class CommonDataService : ICommonDataService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<CommonDataService> _logger;

        public CommonDataService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CommonDataService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IReadOnlyList<VmStandard>> GetAllStandardsAsync(int? schoolId = null)
        {
            _logger.LogInformation("Fetching all standards. SchoolId filter: {SchoolId}", schoolId);
            var query = _unitOfWork.Repository<Standard>().GetQueryable();
            if (schoolId.HasValue)
            {
                query = query.Where(s => s.SchoolId == schoolId.Value || s.SchoolId == null); // Global or school-specific
            }
            var standards = await query.OrderBy(s => s.Name).ToListAsync();
            return _mapper.Map<IReadOnlyList<VmStandard>>(standards);
        }

        public async Task<IReadOnlyList<VmDivision>> GetAllDivisionsAsync(int? schoolId = null)
        {
            _logger.LogInformation("Fetching all divisions. SchoolId filter: {SchoolId}", schoolId);
            var query = _unitOfWork.Repository<Division>().GetQueryable();
            if (schoolId.HasValue)
            {
                query = query.Where(d => d.SchoolId == schoolId.Value || d.SchoolId == null);
            }
            var divisions = await query.OrderBy(d => d.Name).ToListAsync();
            return _mapper.Map<IReadOnlyList<VmDivision>>(divisions);
        }
    }
}
