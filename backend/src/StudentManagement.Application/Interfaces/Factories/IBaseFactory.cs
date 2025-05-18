using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Factories
{
    /// <summary>
    /// Marker interface for all specific factories.
    /// Or could define a common method if all factories share one.
    /// </summary>
    public interface IBaseFactory
    {
        // No common methods needed for this generic abstract factory approach,
        // but you could add one if it made sense, e.g.:
        // Type GetEntityType();
    }
}
