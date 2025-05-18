using SimpleInjector;
using StudentManagement.Application.Interfaces;
using StudentManagement.Application.Interfaces.Factories;
using StudentManagement.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application
{
    public static class Locator
    {
        public static Container Container;
        public static IRepository<T> GetRepository<T>() where T : GenericEntity
        {
            return Container.GetInstance<IRepository<T>>();
        }

        //public static T GetFactory<T>() where T : GenericFactory
        //{
        //    return Container.GetInstance<T>();
        //}

        //public static IGenericObjectFactory<T> GetFactory<T>() where T : GenericFactory, IBaseFactory
        //{
        //    return Container.GetInstance<IGenericObjectFactory<T>>();
        //}
    }
}
