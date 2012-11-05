/**
 * Created with JetBrains WebStorm.
 * User: oelmaallem
 * Date: 5/11/12
 * Time: 11:59
 * To change this template use File | Settings | File Templates.
 */


var describe=function(name,axes,hosts,funtest){
    switch (axes.length){
        case 3:    // 3d
            break;
        case 2:     // 2d
            break;
        case 0:        //  whithout graphic
            break;
        default:
            break;
    }

    funtest();
}
